const Sequelize = require('sequelize');

// 创建 Sequelize 实例，连接到数据库
const sequelize = new Sequelize('webapp', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql'
});

// 定义 User 模型
const User = sequelize.define('User', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

//定义Word模型
const Word = sequelize.define('Word', {
  word: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  }
});

// 同步模型到数据库
sequelize.sync()
  .then(() => {
    console.log('Database and tables created!');
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });

// 导出 User 模型以及 Sequelize 实例，以便在其他文件中使用
module.exports = {
  User,
  Word,
  sequelize
};

