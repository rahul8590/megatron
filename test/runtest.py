#!/usr/bin/env python

import csv
import os
import sys

def rewrite(filename):
    pass

def run_alioth(test):
    pass


def run_test(testname):
    if "alioth" in testname:
        run_alioth(test)

def main():
    try: 
        for fname in os.listdir("./test/"):
            print fname
    except:
        print "Unknown error."
        print ("This script is meant to be run from the root of the " +
               "megatron directory as ./test/runtest.")

if __name__ == "__main__":
    main()