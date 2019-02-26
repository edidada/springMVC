package com.lxk.controller;

import com.google.common.collect.Maps;
import com.lxk.httpModel.JsonResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Map;

/**
 * 测试spring的线程安全问题
 *
 * @author LiXuekai on 2018/12/18
 */
@Controller
@RequestMapping("test")
public class TestController {
    private static final Logger LOG = LoggerFactory.getLogger(WelcomeController.class);

    public static final Map<String, String> MAP = Maps.newHashMap();

    /**
     * init：初始化页面
     */
    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    public JsonResult inits() {
        LOG.debug("---------------TestController: init---------------");
        if (MAP.isEmpty()) {
            MAP.put(System.currentTimeMillis() + "", "大师兄");

        }
        return new JsonResult(true, "lxk", MAP);
    }

}
