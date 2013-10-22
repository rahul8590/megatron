Megatron
========

A Javscript profiler for CMPSCI 630. 


# Dependencies

At a high level this project depends on:

* nodejs
* python

This project depends on the following Node packages: 

* Esprima
* escodegen
* assert

To get them, `npm install esprima escodegen assert`.

# Running the Test Suite

The test suite requires the standalone V8 engine to run the alioth
benchmark suite. You can download and compile V8 with the following
commands:

* `svn co http://v8.googlecode.com/svn/trunk v8`
* `make dependencies`
* `make native`

Then, edit the `test/runtest` script, and change the variable
`D8_PATH` to point to the file in `v8/out/native/d8`.

