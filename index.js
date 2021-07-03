#!/usr/bin/env node

/*
 * 1. self_cli_520 -h | --help 查看帮助
 * 2. self_cli_520 -V | --version 查看版本号
 * 3. self_cli_520 list 查看所有模版
 * 4. self_cli_520 init <template-name> <project-name> 初始化项目
 *     @params
 *         1. process.argv(原生获取命令行方式)
 *         2. 使用快捷方式commander包获取命令行
 *         3. download下载模板
 *         4. ora 拉取模板的状态loading
 *         5. chalk文字样式
 *         6. inquirer 与用户输入的命令行交互，捕获用户输入
 *         7. handleBars 解析文件，传入用户输入，重新聚合
 **/
// 命令行解析
let program = require('commander');
// 下载项目
let download = require('download-git-repo')
// 加载loading
let ora = require('ora')
// 文本样式
let chalk = require('chalk')
// 获取命令行交互
let inquirer = require('inquirer')
// 编译文件包
let handleBars = require('handlebars')
// 操作文件包
let fs = require('fs')
let spinner = ora()

// 获取cli版本号
let {version} = require('./package.json')
program
    .version(version)

// 脚手架对应的模版
let templates = [
  {key: '可视化后台系统前端', value: 'http://github.com:FrontWalker2000/self-vue-sys#master'},
  {key: '可视化后台系统后端', value: 'http://github.com:FrontWalker2000/node-sys#master'},
  {key: '自定义函数库/插件', value: 'http://github.com:FrontWalker2000/self-function#master'},
]

// 选择项目模板下载
let selectTemplate = async (templateName) => {
  let res = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: '请选择需要初始化的项目:',
      default: 'http://github.com:FrontWalker2000/self-vue-sys#master',
      choices: templates
    }
  ])
  // 获取用户选择的模板
  let {choice} = res
  // loading状态
  spinner.start('正在拉取项目模板')
  downloadTemplate(choice, templateName)
}
// 下载模板
let downloadTemplate = (url, project) => {
  download(url, project, {clone: true}, async (err) => {
    if (err) {
      spinner.fail()
      return console.log(err)
    }
    spinner.succeed('模版下载成功，等待项目初始化！')
    // 初始化package.json命令行交互my
    let answers = await inquirer.prompt([
      {
        type: 'input',
        message: '请设置项目名称:',
        name: 'name',
        default: "self-vue-sys" // 默认值
      },
      {
        type: 'input',
        message: '请设置项目作者:',
        name: 'author',
        default: "yangjialin" // 默认值
      },
      {
        type: 'input',
        message: '请设置项目描述:',
        name: 'description',
        default: "vue simple of sys" // 默认值
      },
      {
        type: 'confirm',
        message: '请设置项目是否私有:',
        name: 'private',
        default: true // 默认值
      }
    ])
    const path = `${project}/package.json`
    // 读取package.json
    let packCont = fs.readFileSync(path, "utf8")
    let compileCont = handleBars.compile(packCont)(answers)
    // 重新写入
    fs.writeFileSync(path, compileCont)
    spinner.succeed(chalk.green('初始化模版完成，感谢一路奋斗的你！'))
  })
}

let mapAction =

// 初始化命令行（self_cli_520 init my_template）
program
    .command('init <project>')
    .description('选择项目模版')
    .action((project) => {
      // 下载模版
      selectTemplate(project)
    })

// 初始化命令行（self_cli_520 init my_template）
program
    .command('list')
    .description('查看所有的可用模版')
    .action(() => {
      for (let key in templates) {
        console.log(templates[key])
      }
    })

program
    .command('*')
    .description('找不到相应的命令')
    .action(() => {
      spinner.fail(chalk.red('找不到相应的命令！'))
    })
// 解析命令行
program.parse(process.argv)