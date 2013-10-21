#!/usr/bin/env python

import csv, os, sys, tempfile, subprocess

TMPDIR="/tmp/megatron"

def setup():
    print "Starting test run"
    os.environ['MEGATRON_HOME'] = os.path.join(
        os.path.abspath(os.path.dirname(sys.argv[0])), "..")
    try:
        os.mkdir(TMPDIR)
    except OSError as e:
        if e.errno == 17:
            pass
        else:
            raise e

def rewrite(filename):
    output = tempfile.NamedTemporaryFile(dir=TMPDIR, delete=False)
    ret = os.system("nodejs src/rewrite.js {} 2>/dev/null >{}".
                    format(filename, output.name))
    return (ret, output.name)

def run_test(test, profiled_program_path):
    cmdline = "{} {} {} 2>&1".format(test['runcmd'],
                                                profiled_program_path, 
                                                test['args'])
    retval = os.system(cmdline)
    return retval == 0

def main():
    rewrite_fail, run_fail = [], []
    tmpfiles = []
    total = 0
    test_file_name = ""
    if len(sys.argv) < 2:
        test_file_name = sys.argv[0].replace("runtest.py", "test.csv")
    else:
        test_file_name = sys.argv[1]

    setup()
    os.system("echo ${MEGATRON_HOME}")

    dr = csv.DictReader(open(test_file_name, "r"))
    for test in dr:
        total += 1
        (ex, profiled_program) = rewrite(test['file'])
        if ex != 0:
            rewrite_fail.append(test['file'])
        x = run_test(test, profiled_program)
        if not x:
            run_fail.append(test['file'])
        if x and (ex == 0):
            tmpfiles.append(profiled_program)
            

    if len(rewrite_fail) > 0 or len(run_fail) > 0:
        print " *** Failures! ***"
    if len(rewrite_fail) > 0:
        for rwf in rewrite_fail:
            print "Failed to rewrite: {}".format(rwf)
    else:
        print "Successfully rewrote {} cases.".format(total)
    
    if len(run_fail) > 0:
        for rwf in run_fail:
            print "Failed to run: {}".format(rwf)
    else:
        print "Successfully ran {} cases.".format(total)

    for t in tmpfiles:
        os.remove(t)
            

if __name__ == "__main__":
    main()