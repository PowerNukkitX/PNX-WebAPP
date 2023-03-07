# 进入APP文件夹
cd APP || exit
# 重命名dist文件夹为hub并进入
mv dist hub
# 压缩hub文件夹中的所有内容到hub.zip
zip -r hub.zip ./hub/*
# 将压缩包通过PUT请求上传到powernukkitx.com/deploy/static，并将access-token=abc添加到请求头中
curl -X PUT -L \
     -T hub.zip \
     -H "access-token: $1" \
     https://powernukkitx.com/deploy/static