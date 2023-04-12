$(function() {
    var form = layui.form

    var layer = layui.layer

    initUserInfo()

    function initUserInfo() {
        $.ajax({
            method: 'GET',
            url: '/my/userinfo',
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取用户信息失败!')
                }
                form.val('formUserInfo', res.data)
            }
        })
        $('#btnReset').on('click', function(e) {
            e.preventDefault()
            initUserInfo()
        })
        $('.layui-form').submit(function(e) {
            e.preventDefault()
            var data = {
                id: $('[name=id]').val(),
                nickname: $('[name=nickname]').val(),
                email: $('[name=email]').val(),
                username: $('[name=username]').val()
            }
            $.ajax({
                method: 'POST',
                url: '/my/userinfo',
                data: data,
                success: function(res) {
                    if (res.status !== 0) {
                        return layer.msg('更新信息失败!')
                    }
                    layer.msg('更新信息成功!')
                    window.parent.getUserInfo()
                }
            })
        })
    }
})