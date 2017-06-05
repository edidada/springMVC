package com.lxk.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

/**
 * Created by lxk on 2017/6/5
 */
@Controller
@RequestMapping("welcome")
public class WelcomeController {
    private static final Logger LOG = LoggerFactory.getLogger(WelcomeController.class);


    /**
     * init：初始化页面
     */
    @RequestMapping(value = "", method = RequestMethod.GET)
    public ModelAndView init() {
        LOG.debug("---------------BlogController: init---------------");

        ModelAndView mav = new ModelAndView();
        mav.setViewName("/welcome/LetterDrop");
        return mav;
    }
}
