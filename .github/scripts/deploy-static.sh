# 压缩Index/src/main/web文件夹到static.zip
zip -r static.zip Index/src/main/web
# 将压缩包通过PUT请求上传到powernukkitx.com/deploy/static，并将access-token=abc添加到请求头中
curl --request PUT -sL \
     --url 'https://powernukkitx.com/deploy/static'\
     -F "file=@static.zip"\
     -H "access-token: $1"