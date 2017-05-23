package com.lxk.utils;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * JSON 转换
 */
public final class JsonConvertUtils {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    /**
     * json对象转成string
     *
     * @param object 待转化为 JSON字符串 对象
     * @return json 串 or null
     */
    public static String parseJsonToString(Object object) {
        String string = null;

        try {
            string = OBJECT_MAPPER.writeValueAsString(object);
        } catch (Exception ignored) {
        }
        return string;
    }
}
