// 文章的路由模块

const express = require('express')
const router = express.Router()

// 导入需要的处理函数模块
const article_handler = require('../router_handler/article')

// 导入验证数据的中间件
const expressJoi = require('@escook/express-joi');
// 导入文章的验证模块
const { add_article_schema, delete_article_schema } = require('../schema/article');
const { get_article_schema, update_article_schema } = require('../schema/article');

// 注意：使用 express.urlencoded() 中间件无法解析 multipart/form-data 格式的请求体数据。
// 导入解析 formdata 格式表单数据的包

// 导入 multer 和 path
const multer = require('multer')
const path = require('path')

// 创建 multer 的实例
const uploads = multer({ dest: path.join(__dirname, '../uploads') })

// 发布文章的路由
router.post('/add', uploads.single('cover_img'), expressJoi(add_article_schema), article_handler.addArticle)

// 获取文章的列表数据的路由
router.get('/list', article_handler.getArticles);

router.get('/total', article_handler.getTotal);

// 删除文章的路由
router.get('/delete/:id', expressJoi(delete_article_schema), article_handler.deleteArtById);

// 根据 Id 获取文章详情 的路由
router.get('/:id', expressJoi(get_article_schema), article_handler.getArticleById);

// 更新文章的路由
router.post('/edit', uploads.single('cover_img'), expressJoi(update_article_schema), article_handler.updateArticleById);


module.exports = router