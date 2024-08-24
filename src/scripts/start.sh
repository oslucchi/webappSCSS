#!/bin/bash
ls "`pwd`/src/environments/environment.$1.ts"
cp "`pwd`/src/environments/environment.$1.ts" "`pwd`/src/environments/environment.ts"
ng serve --host 0.0.0.0 --disableHostCheck
