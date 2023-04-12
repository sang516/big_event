$(function() {
    var form = layui.form

    form.verify({
        pwd: [
            /^[\S]{6,12}$/, '密码必须6到12位，且不能出现空格'
        ],
        samePwd: function(value) {
            if (value === $('[name=oldPwd]').val()) {
                return '新密码和旧密码不能相同!'
            }
        },
        rePwd: function(value) {
            if (value !== $('[name=newPwd]').val()) {
                return '两个密码不一致'
            }
        }
    })
    $('.layui-form').submit(function(e) {
        e.preventDefault()
        var data = {
            oldPwd: $('[name=oldPwd]').val(),
            newPwd: $('[name=newPwd]').val()
        }
        $.ajax({
            method: 'POST',
            url: '/my/updatepwd',
            data,
            success: function(res) {
                if (res.status !== 0) {
                    return layui.layer.msg('修改密码失败!')
                }
                layui.layer.msg('修改密码成功!')
                $('.layui-form')[0].reset()
            }
        })
    })
})