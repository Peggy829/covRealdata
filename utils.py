# encoding:utf-8
import time
import pymysql
import redis
import requests
import json
import traceback
import re
import string
import jieba.analyse
from redis.sentinel import Sentinel
# 连接哨兵服务器(主机名也可以用域名)

sentinel = None
MASTER = None
SLAVE = None

def get_redis_conn():
    global sentinel
    global MASTER
    global SLAVE
    # 如果哨兵连接实例已存在, 不重复连接, 当连接失效时, 重新连接
    if not sentinel:  # 连接哨兵
        # 尝试连接最长时间单位毫秒, 1000毫秒为1秒
        sentinel = Sentinel([('ikarosx.cn', 26379),
                     ('ikarosx.cn', 26380),
                     ('ikarosx.cn', 26381)
                     ],
                    socket_timeout=2000)
        # 通过哨兵获取主数据库连接实例      参数1: 主数据库的名字(集群部署时在配置文件里指明)
        MASTER = sentinel.master_for(
            'mymaster', socket_timeout=2000, password='redis6379',decode_responses=True)
        # 通过哨兵获取从数据库连接实例    参数1: 从数据的名字(集群部署时在配置文件里指明)
        SLAVE = sentinel.slave_for(
            'mymaster', socket_timeout=2000, password='redis6379',decode_responses=True)
# 每次都先尝试生成连接实例
get_redis_conn()

# pool = redis.ConnectionPool(
#     host='117.78.11.146', port=6379, decode_responses=True, password='peggy')
# myredis = redis.Redis(connection_pool=pool)


# def get_time():
#     time_str = time.strftime("%Y{}%m{}%d{} %X")
#     return time_str.format("年", "月", "日")


def get_conn():
    """
    :return: 连接，游标
    """
    # 创建连接
    conn = pymysql.connect(host="117.78.11.146",
                           user="know",
                           port=3307,
                           password="know",
                           db="know",
                           charset="utf8")
    # 创建游标
    cursor = conn.cursor()  # 执行完毕返回的结果集默认以元组显示
    return conn, cursor


def close_conn(conn, cursor):
    cursor.close()
    conn.close()


def query(sql, *args):
    """
    封装通用查询
    :param sql:
    :param args:
    :return: 返回查询到的结果，((),(),)的形式
    """
    conn, cursor = get_conn()
    cursor.execute(sql, args)
    res = cursor.fetchall()
    close_conn(conn, cursor)
    return res


def get_c1_data():
    return SLAVE.get('c1')

# def refresh_c1_data():
#     """
#     :return: 返回大屏div id=c1 的数据
#     """
#     # 因为会更新多次数据，取时间戳最新的那组数据
#     sql = "select sum(confirm)," \
#           "(select suspect from history order by ds desc limit 1)," \
#           "sum(heal)," \
#           "sum(dead) " \
#           "from details " \
#           "where update_time=(select update_time from details order by update_time desc limit 1)"
#     res = query(sql)
#     data = res[0]
#     MASTER.set('c1',json.dumps({"confirm":float(data[0]),"suspect":data[1],"heal":float(data[2]),"dead":float(data[3])}))


def get_c2_data():
    return SLAVE.get('c2')


def refresh_c2_data():
    """
    :return:  返回各省数据
    """
    # 因为会更新多次数据，取时间戳最新的那组数据
    sql = "select province,sum(confirm) from details " \
          "where update_time=(select update_time from details " \
          "order by update_time desc limit 1) " \
          "group by province"
    data = query(sql)
    res = []
    for tup in data:
        # print(tup)
        res.append({"name": tup[0], "value": int(tup[1])})
    MASTER.set('c2', json.dumps({"data": res}))


def get_l1_data():
    return SLAVE.get('l1')


def refresh_l1_data():
    sql = "select ds,confirm,suspect,heal,dead from history"
    data = query(sql)
    day, confirm, suspect, heal, dead = [], [], [], [], []
    for a, b, c, d, e in data[7:]:
        day.append(a.strftime("%m-%d"))  # a是datatime类型
        confirm.append(b)
        suspect.append(c)
        heal.append(d)
        dead.append(e)
    MASTER.set('l1', json.dumps(
        {"day": day, "confirm": confirm, "suspect": suspect, "heal": heal, "dead": dead}))


def get_l2_data():
    return SLAVE.get('l2')


def refresh_l2_data():
    sql = "select ds,confirm_add,suspect_add from history"
    data = query(sql)
    day, confirm_add, suspect_add = [], [], []
    for a, b, c in data[7:]:
        day.append(a.strftime("%m-%d"))  # a是datatime类型
        confirm_add.append(b)
        suspect_add.append(c)
    MASTER.set('l2', json.dumps(
        {"day": day, "confirm_add": confirm_add, "suspect_add": suspect_add}))


def get_r1_data():
    return SLAVE.get('r1')


def refresh_r1_data():
    """
    :return:  返回非湖北地区城市确诊人数前5名
    """
    sql = 'SELECT city,confirm FROM ' \
          '(select city,confirm from details  ' \
          'where update_time=(select update_time from details order by update_time desc limit 1) ' \
          'and province not in ("湖北","北京","上海","天津","重庆") ' \
          'union all ' \
          'select province as city,sum(confirm) as confirm from details  ' \
          'where update_time=(select update_time from details order by update_time desc limit 1) ' \
          'and province in ("北京","上海","天津","重庆") group by province) as a ' \
          'ORDER BY confirm DESC LIMIT 5'
    data = query(sql)
    city = []
    confirm = []
    for k, v in data:
        city.append(k)
        confirm.append(int(v))
    MASTER.set('r1', json.dumps({"city": city, "confirm": confirm}))


def get_r2_data():
    return SLAVE.get('r2')


def refresh_r2_data():
    """
    :return:  返回最近的20条热搜
    """
    # sql = 'select content from hotsearch order by id desc limit 20'
    # data = query(sql)  # 格式 (('民警抗疫一线奋战16天牺牲1037364',), ('四川再派两批医疗队1537382',)
    data = get_baidu_data()
    if data == '':
        print('获取数据为空')
        return
    print('更新百度疫情热搜')
    d = []
    for i in data:
        k = i.rstrip(string.digits)  # 移除热搜数字
        v = i[len(k):]  # 获取热搜数字
        ks = jieba.analyse.extract_tags(k)  # 使用jieba 提取关键字
        for j in ks:
            if not j.isdigit():
                d.append({"name": j, "value": v})
    value = json.dumps({"kws": d})
    if not value == '':
        MASTER.set('r2', value)


def getNowConfirm():
    return SLAVE.get('nowConfirmList')


def get_tencent_data():
    """
    :return: 返回历史数据和当日详细数据
    """
    url = 'https://view.inews.qq.com/g2/getOnsInfo?name=disease_other'
    url2 = 'https://view.inews.qq.com/g2/getOnsInfo?name=disease_h5'
    headers = {
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Mobile Safari/537.36',
        'Referer': ' https://news.qq.com/zt2020/page/feiyan.htm'
    }
    r = requests.get(url, headers)
    r2 = requests.get(url2, headers)
    res = json.loads(r.text)  # json字符串转字典
    res2 = json.loads(r2.text)
    data_all = json.loads(res['data'])
    data_all2 = json.loads(res2['data'])
    update_time = data_all2["lastUpdateTime"]
    update_time=str(update_time)
    print(update_time)
    redis_update_time = SLAVE.get('lastUpdateTime')
    print(redis_update_time)
    print(redis_update_time is not None)
    if redis_update_time is not None and redis_update_time >= update_time:
        print('腾讯数据尚未更新')
        return
    MASTER.set('lastUpdateTime', update_time)
    history = {}  # 历史数据
    for i in data_all["chinaDayList"]:
        ds = "2020." + i["date"]
        tup = time.strptime(ds, "%Y.%m.%d")
        ds = time.strftime("%Y-%m-%d", tup)  # 改变时间格式,不然插入数据库会报错，数据库是datetime类型
        confirm = i["confirm"]
        suspect = i["suspect"]
        heal = i["heal"]
        dead = i["dead"]
        history[ds] = {"confirm": confirm,
                       "suspect": suspect, "heal": heal, "dead": dead}
    for i in data_all["chinaDayAddList"]:
        ds = "2020." + i["date"]
        tup = time.strptime(ds, "%Y.%m.%d")
        ds = time.strftime("%Y-%m-%d", tup)
        confirm = i["confirm"]
        suspect = i["suspect"]
        heal = i["heal"]
        dead = i["dead"]
        history[ds].update(
            {"confirm_add": confirm, "suspect_add": suspect, "heal_add": heal, "dead_add": dead})

    details = []  # 当日详细数据
    # c1大屏
    MASTER.set('c1', json.dumps(data_all2['chinaTotal']))
    data_country = data_all2["areaTree"]  # list 25个国家
    data_province = data_country[0]["children"]  # 中国各省
    nowConfirmList = []
    for pro_infos in data_province:
        province = pro_infos["name"]  # 省名
        nowConfirm = pro_infos["total"]["nowConfirm"]
        if nowConfirm != 0:
            nowConfirmList.append(
                {'city': pro_infos['name'], 'nowConfirm': nowConfirm})
        for city_infos in pro_infos["children"]:
            if city_infos["name"] == '地区待确认':
                city_infos["name"] = '香港'
            city = city_infos["name"]
            confirm = city_infos["total"]["confirm"]

            confirm_add = city_infos["today"]["confirm"]
            heal = city_infos["total"]["heal"]
            dead = city_infos["total"]["dead"]
            details.append([update_time, province, city,
                            confirm, confirm_add, heal, dead])
    MASTER.set('nowConfirmList', json.dumps(nowConfirmList))
    update_details(details)
    update_history(history)


def update_details(li):
    """
    更新 details 表
    :return:
    """
    cursor = None
    conn = None
    try:
        # li = get_tencent_data()[1]  #  0 是历史数据字典,1 最新详细数据列表
        conn, cursor = get_conn()
        sql = "insert into details(update_time,province,city,confirm,confirm_add,heal,dead) values(%s,%s,%s,%s,%s,%s,%s)"
        # 对比当前最大时间戳
        sql_query = 'select %s=(select update_time from details order by id desc limit 1)'
        cursor.execute(sql_query, li[0][0])
        if not cursor.fetchone()[0]:
            for item in li:
                cursor.execute(sql, item)
            conn.commit()  # 提交事务 update delete insert操作
            refresh_c2_data()
            refresh_r1_data()
            print('更新redis有关details表的数据')
        else:
            print("已是最新详细数据！")
    except:
        traceback.print_exc()
    finally:
        close_conn(conn, cursor)


def update_history(dic):
    """
    更新历史数据
    :return:
    """
    cursor = None
    conn = None
    try:
        # dic = get_tencent_data()[0]  #  0 是历史数据字典,1 最新详细数据列表
        print("开始更新历史数据")
        conn, cursor = get_conn()
        sql = "insert into history values(%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        sql_query = "select confirm from history where ds=%s"
        flag = False
        for k, v in dic.items():
            # item 格式 {'2020-01-13': {'confirm': 41, 'suspect': 0, 'heal': 0, 'dead': 1}
            if not cursor.execute(sql_query, k):
                flag = True
                cursor.execute(sql, [k, v.get("confirm"), v.get("confirm_add"), v.get("suspect"),
                                     v.get("suspect_add"), v.get(
                                         "heal"), v.get("heal_add"),
                                     v.get("dead"), v.get("dead_add")])
        conn.commit()  # 提交事务 update delete insert操作
        if flag:
            refresh_l1_data()
            refresh_l2_data()
            print('更新redis有关history表的数据')
            print("历史数据更新完毕")
        print("历史数据无需更新")
    except:
        traceback.print_exc()
    finally:
        close_conn(conn, cursor)


def get_baidu_data():
    baidu_url = 'https://opendata.baidu.com/api.php?query=%E5%85%A8%E5%9B%BD&resource_id=39258&tn=wisetpl&format=json&sa=osari_hotword_tab'
    headers = {
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Mobile Safari/537.36',
    }
    resposne = requests.get(baidu_url, headers=headers)
    resposne.encoding = 'gbk'
    res = json.loads(resposne.text)
    itemList = res['data'][0]['list']
    pattern = re.compile(r'\"degree\":.*?(\d+).*?\"query\":(.*?),')
    reResult = pattern.findall(json.dumps(itemList))
    unicodeResult = [line[1].encode().decode('unicode_escape')+line[0]
                     for line in reResult]
    return unicodeResult


if __name__ == "__main__":
    get_tencent_data()
    # refresh_l1_data()
    # refresh_l2_data()
    # refresh_r2_data()
