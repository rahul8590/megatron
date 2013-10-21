#!/usr/bin/env python

import csv, os, sys, tempfile, subprocess

TMPDIR="/tmp/megatron"

def setup():
    print "Starting test run"
    try:
        os.mkdir(TMPDIR)
    except OSError as e:
        if e.errno == 17:
            pass
        else:
            raise e

def rewrite(filename):
    output = tempfile.NamedTemporaryFile(dir=TMPDIR, delete=False)
    po = subprocess.Popen("nodejs src/rewrite.js {}".format(filename), 
                         shell=True, stdout=output.file, stderr=subprocess.PIPE)
    return (po.wait(), output.name)

def run_alioth(test):
    pass

def run_test(testname):
    if "alioth" in testname:
        run_alioth(test)

def main():
    rewrite_fail, run_fail = [], []
    tmpfiles = []
    test_file_name = sys.argv[1]
    total = 0

    setup()

    dr = csv.DictReader(open(test_file_name, "r"))
    for test in dr:
        total += 1
        (ex, profiled_program) = rewrite("test/" + test['file'])
        tmpfiles.append(profiled_program)
        if ex != 0:
            failures.append(test.file)

    if len(rewrite_fail) > 0:
        print "***FAILURES:"
        for rwf in rewrite_fail:
            print "\t* {}".format(rwf)
    else:
        print "Successfully rewrote {} cases.".format(total)

    for t in tmpfiles:
        os.remove(t)
            

if __name__ == "__main__":
    main()