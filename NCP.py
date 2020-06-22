# encoding:utf-8
from flask import Flask
from flask import render_template
from flask import  jsonify
import utils
import string
from jieba.analyse import extract_tags
from flask_apscheduler import APScheduler

class Config(object):  # 创建配置，用类
    # 任务列表
    JOBS = [  
        {  
            'id': 'getData',
            'func': 'utils:get_tencent_data', # 方法名
            # 'args': (1,2), # 入参
            'trigger': 'interval', # interval表示循环任务
            'seconds': 30,
        },
        { 
            'id': 'updateHotsearch',
            'func': 'utils:refresh_r2_data', # 方法名
            # 'args': (1,2), # 入参
            'trigger': 'interval', # interval表示循环任务
            'seconds': 30,
        }
    ]

app = Flask(__name__)
app.config['DEBUG'] = True

@app.route("/")
def hello_world():
    return render_template("main.html")


@app.route("/nowConfirm")
def get_time():
    return utils.getNowConfirm()

@app.route("/c1")
def get_c1_data():
    return utils.get_c1_data()

@app.route("/c2")
def get_c2_data():
    return utils.get_c2_data()

@app.route("/l1")
def get_l1_data():
    return utils.get_l1_data()

@app.route("/l2")
def get_l2_data():
    return utils.get_l2_data()

@app.route("/r1")
def get_r1_data():
   return utils.get_r1_data()

@app.route("/r2")
def get_r2_data():
    return utils.get_r2_data()
if __name__ == '__main__':
    app.config.from_object(Config())
    scheduler=APScheduler()
    scheduler.init_app(app)
    scheduler.start()
    app.run(host='0.0.0.0', port=5000)
