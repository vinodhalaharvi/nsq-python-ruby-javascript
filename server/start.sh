nsqd --lookupd-tcp-address=0.0.0.0:4160 &
nsqadmin --lookupd-http-address=0.0.0.0:4161 &
nsqlookupd &
make test
