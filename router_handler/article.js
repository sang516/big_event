// 文章的处理函数模块
const { rmSync } = require('fs')
const path = require('path')
const db = require('../db/index')

// 发布文章的处理函数
exports.addArticle = (req, res) => {
    if (!req.file || req.file.fieldname !== 'cover_img') return res.cc('文章封面是必选参数！')

    // TODO：证明数据都是合法的，可以进行后续业务逻辑的处理
    // 处理文章的信息对象
    const articleInfo = {
        // 标题、内容、发布状态、所属分类的Id
        ...req.body,
        // 文章封面的存放路径
        cover_img: path.join('/uploads', req.file.filename),
        // 文章的发布时间
        pub_date: new Date(),
        // 文章作者的Id
        author_id: req.user.id,
    }

    const sql = `insert into ev_articles set ?`
    db.query(sql, articleInfo, (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows !== 1) return res.cc('发布新文章失败！')
        res.cc('发布文章成功！', 0)
    })
}

exports.getTotal = (req, res) => {
    if (!req.query.cate_id) {
        const sql_count = `SELECT COUNT(*) total from ev_articles WHERE is_delete=0`
        db.query(sql_count, (err, results) => {
            if (err) return res.cc(err);

            res.send({
                status: 0,
                message: '获取文章总数成功！',
                data: results[0]['total']
            })
        })
    } else {
        const sql_count = `SELECT COUNT(*) total from ev_articles WHERE is_delete=0 AND cate_id = ?`
        db.query(sql_count, req.query.cate_id, (err, results) => {
            if (err) return res.cc(err);

            res.send({
                status: 0,
                message: '获取文章总数成功！',
                data: results[0]['total']
            })
        })
    }
}

// 获取文章的列表数据的处理函数
exports.getArticles = (req, res) => {
    // 根据分类的状态，获取所有未被删除的文章列表数据
    // is_delete 为 0 表示没有被 标记为删除 的数据
    // var total = 0
    // const sql_count = `SELECT COUNT(*) total from ev_articles`
    // db.query(sql_count, (err, results) => {
    //     total = results[0]['total']
    // })
    // function getTotal() {
    //     db.query(`SELECT COUNT(*) total from ev_articles`, (err, results) => {
    //         return results[0]['total']
    //     })
    // }
    if (!req.query.cate_id && !req.query.state) {
        const sql = `SELECT a.*,c.name cate_name
        FROM ev_articles a LEFT OUTER JOIN ev_article_cate c ON a.cate_id=c.id
        WHERE a.is_delete=0 ORDER BY a.id ASC
        LIMIT ?,?`;
        db.query(sql, [(req.query.pagenum - 1) * req.query.pagesize, Number(req.query.pagesize)], (err, results) => {
            if (err) return res.cc(err);
            res.send({
                status: 0,
                message: '获取文章列表成功！',
                data: results,
                total: results.length
            })
        })
    } else if (!req.query.cate_id && req.query.state) {
        const sql = `SELECT a.*,c.name cate_name FROM
        ev_articles a,ev_article_cate c
        WHERE a.state=? AND a.cate_id=c.id AND a.is_delete=0
        LIMIT ?,?`;
        db.query(sql, [req.query.state, (req.query.pagenum - 1) * req.query.pagesize, Number(req.query.pagesize)], (err, results) => {
            if (err) return res.cc(err);
            res.send({
                status: 0,
                message: '获取文章列表成功！',
                data: results,
                total: results.length
            })
        })
    } else if (req.query.cate_id && req.query.state) {
        const sql = `SELECT a.*,c.name cate_name
        FROM ev_articles a LEFT OUTER JOIN ev_article_cate c ON a.cate_id=c.id
        WHERE a.state=? AND a.cate_id=? AND a.is_delete=0
        LIMIT ?,?`
        db.query(sql, [req.query.state, req.query.cate_id, (req.query.pagenum - 1) * req.query.pagesize, Number(req.query.pagesize)], (err, results) => {
            if (err) return res.cc(err);
            res.send({
                status: 0,
                message: '获取文章列表成功！',
                data: results,
                total: results.length
            })
        })
    } else if (!req.query.state && req.query.cate_id) {
        const sql = `SELECT a.*,c.name cate_name
        FROM ev_articles a,ev_article_cate c
        WHERE a.cate_id=? AND a.cate_id=c.id AND a.is_delete=0
        LIMIT ?,?`;
        db.query(sql, [req.query.cate_id, (req.query.pagenum - 1) * req.query.pagesize, Number(req.query.pagesize)], (err, results) => {
            if (err) return res.cc(err);
            res.send({
                status: 0,
                message: '获取文章列表成功！',
                data: results,
                total: results.length
            })
        })
    }
}

// 删除文章分类的处理函数
exports.deleteArtById = (req, res) => {
    const sql = `update ev_articles set is_delete=1 where id=?`;
    db.query(sql, req.params.id, (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err);
        // SQL 语句执行成功，但是影响行数不等于 1
        if (results.affectedRows !== 1) return res.cc('删除文章失败！');
        // 删除文章分类成功
        res.cc('删除文章成功！', 0);
    })
}


// 根据 Id 获取文章信息的处理函数
exports.getArticleById = (req, res) => {
    const sql = `SELECT a.*,c.name cate_name
    FROM ev_articles a LEFT OUTER JOIN ev_article_cate c ON a.cate_id=c.id
    WHERE a.id = ? AND a.is_delete = 0`;
    db.query(sql, req.params.id, (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err);
        // SQL 语句执行成功，但是没有查询到任何数据
        if (results.length !== 1) return res.cc('获取文章信息失败！');
        // 把数据响应给客户端
        res.send({
            status: 0,
            message: '获取文章信息成功！',
            data: results[0],
        })
    })
}


// 更新文章的处理函数
exports.updateArticleById = (req, res) => {
    // 手动判断是否上传了文章封面
    if (!req.file || req.file.fieldname !== 'cover_img') return res.cc('文章封面是必选参数！');
    // 更新文章信息
    // 1.整理要修改入数据库的文章信息对象
    const articleInfo = {
            // 标题、内容、状态、所属的分类Id
            ...req.body,
            // 文章封面在服务器端的存放路径
            cover_img: path.join('/uploads', req.file.filename),
        }
        // 2.执行 SQL 语句
    const sql = `update ev_articles set ? where id=?`;
    db.query(sql, [articleInfo, req.body.Id], (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err);
        // SQL 语句执行成功，但是影响行数不等于 1
        if (results.affectedRows !== 1) return res.cc('更新文章失败！');
        // 更新文章分类成功
        res.cc('更新文章成功！');
    })
}