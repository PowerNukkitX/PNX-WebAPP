# 压缩Index/src/main/web文件夹中的所有内容到static.zip
cd Index/src/main/web || exit
zip -r static.zip ./*
# 将压缩包通过PUT请求上传到powernukkitx.com/deploy/static，并将access-token=abc添加到请求头中
curl -X PUT -L \
     -T Index/src/main/web/static.zip \
     -H "access-token: $1" \
     https://powernukkitx.com/deploy/static