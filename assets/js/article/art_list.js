// const { $ } = require("@hapi/joi/lib/base")

$(function() {
    var layer = layui.layer
    var laypage = layui.laypage
    var form = layui.form

    template.defaults.imports.dataFormat = function(date) {
        const dt = new Date(date)
        var y = dt.getFullYear()
        var m = padZero(dt.getMonth() + 1)
        var d = padZero(dt.getDate())

        var hh = padZero(dt.getHours())
        var mm = padZero(dt.getMinutes())
        var ss = padZero(dt.getSeconds())

        return y + '年' + m + '月' + d + '日' + ' ' + hh + ':' + mm + ':' + ss
    }

    function padZero(n) {
        return n > 9 ? n : '0' + n
    }

    var q = {
        pagenum: 1,
        pagesize: 2,
        cate_id: '',
        state: '',
        total: 0
    }

    initTable()
    initCate()

    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/total',
            data: q,
            success: function(res) {
                q.total = res.data
            }
        })
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function(res) {
                if (res.status !== 0) {
                    return layui.layer.msg(res.message)
                }
                var htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr);
                renderPage();
            }
        })
    }

    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if (res.status !== 0) {
                    return layui.layer.msg(res.message)
                }
                var htmlStr = template('tpl-cate1', res)
                $('[name=cate_id]').html(htmlStr)
                layui.form.render()
            }
        })
    }

    $('#form-search').on('submit', function(e) {
        e.preventDefault()
        var cate_id = $('[name=cate_id]').val()
        var state = $('[name=state]').val()
        q.cate_id = cate_id
        q.state = state
        initTable()
    })

    function renderPage() {
        laypage.render({
            elem: 'pageBox',
            count: q.total,
            limit: q.pagesize,
            curr: q.pagenum,
            limits: [2, 3, 5, 10],
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            jump: function(obj, first) {
                q.pagenum = obj.curr
                q.pagesize = obj.limit
                if (!first) {
                    initTable()
                }
            }
        })
        $('tbody').on('click', '.btn-delete', function() {
            var len = $('.btn-delete').length
            var id = $(this).attr('data-id')
            layer.confirm('确认删除？', { icon: 3, title: '提示' }, function(index) {
                $.ajax({
                    method: 'GET',
                    url: '/my/article/delete/' + id,
                    success: function(res) {
                        if (res.status !== 0) {
                            return layer.msg(res.message)
                        }
                        layer.msg(res.message)
                        if (len === 1) {
                            q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                        }
                        initTable()
                    }
                })
                layer.close(index);
            });
        })
    }

    function editArticle(data) {
        $('#editArticle').show();
        $('#art_list').hide();
        var htmlStr = template('tpl-cate-body', data)
        $('#edit-body').html(htmlStr)
        initCate2(data)
        initEditor()
    }

    $('tbody').on('click', '.btn-edit', function() {
        var id = $(this).attr('data-id')
        layer.confirm('是否编辑文章信息？', { icon: 3, title: '提示' }, function(index) {
            $.ajax({
                method: 'GET',
                url: '/my/article/' + id,
                success: function(res) {
                    if (res.status !== 0) {
                        return layer.msg(res.message)
                    }
                    // location.href = '/article/art_pub.html'
                    editArticle(res.data);
                }
            })
            layer.close(index)
        })
    })

    function initCate2(data) {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if (res.status !== 0) return layer.msg(res.message)
                var allData = { res, data }
                var htmlStr = template('tpl-cate2', allData)
                $('#cate_id2').html(htmlStr)
                form.render()
            }
        })
    }

})