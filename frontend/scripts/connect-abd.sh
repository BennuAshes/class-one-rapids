 #export WSL_HOST=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')
 #adb connect $WSL_HOST:5585
 adb connect 172.22.6.17:5585