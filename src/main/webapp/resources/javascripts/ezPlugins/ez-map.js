/**
 * js 实现的 Map
 *
 * @author wei.Li by 15/1/28 (gourderwa@163.com).
 */


/**
 * 定义map
 * @constructor
 */
function Map() {
    this.container = {};
}

/**
 * 将key-value放入map中
 * @param key key
 * @param value value
 */
Map.prototype.put = function (key, value) {
    if (key) {
        this.container[key] = value;
    }
};

/**
 * 根据 key 从 map 中取出对应的 value
 * @param key key
 * @returns {*} 未找到为 undefined
 */
Map.prototype.get = function (key) {
    var container = this.container[key];
    return container || undefined;
};

/**
 * 判断map中是否包含指定的key
 * @param key key
 * @returns {*}
 */
Map.prototype.containsKey = function (key) {

    for (var p in this.container) {
        if (p == key) {
            return true;
        }
    }
    return false;
};

/**
 * 判断map中是否包含指定的value
 * @param value value
 * @returns {boolean}
 */
Map.prototype.containsValue = function (value) {

    for (var p in this.container) {
        if (this.container[p] === value) {
            return true;
        }
    }
    return false;
};

/**
 * 删除map中指定的key
 * @param key 待删除key
 */
Map.prototype.remove = function (key) {
    delete this.container[key];
};

/**
 * 清空map
 */
Map.prototype.clear = function () {
    delete this.container;
    this.container = {};
};

/**
 * 判断map是否为空
 * @returns {boolean} true 表示为空
 */
Map.prototype.isEmpty = function () {
    return this.keyArray().length == 0;
};

/**
 * 获取map的大小
 * @returns {*}
 */
Map.prototype.size = function () {
    return this.keyArray().length;
};

/**
 * 返回map中的key值数组
 * @returns {Array}
 */
Map.prototype.keyArray = function () {

    var keys = [];
    for (var p in this.container) {
        keys.push(p);
    }
    return keys;
};

/**
 * 返回map中的value值数组
 * @returns {Array}
 */
Map.prototype.valueArray = function () {

    var values = [];
    var keys = this.keyArray();
    for (var i = 0, size = keys.length; i < size; i++) {
        values.push(this.container[keys[i]]);
    }
    return values;
};
