$(function() {
    getUserInfo()

    var layer = layui.layer

    $('#btnLogout').on('click', function() {
        layer.confirm('确定退出登陆?', { icon: 3, title: '提示' },
            function(index) {
                localStorage.removeItem('token')
                location.href = '/login.html'
                layer.close(index);
            })
    })
})

function getUserInfo() {
    $.ajax({
        method: 'GET',
        url: '/my/userinfo',
        success: function(res) {
            if (res.status !== 0) {
                location.href = '/login.html'
                return layui.layer.msg('请先登录!')
            }
            renderAvatar(res.data)
        }
    })
}

function renderAvatar(user) {
    var name = user.nickname || user.username
    $('#welcome').html('欢迎&nbsp;&nbsp;' + name)
    if (user.user_pic !== null) {
        $('.layui-nav-img').attr('src', user.user_pic)
            .show()
        $('.text-avatar').hide()
    } else {
        $('.layui-nav-img').hide()
        var first = name[0].toUpperCase()
        $('.text-avatar').html(first).show()
    }
}