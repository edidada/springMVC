package com.lxk.controller;

import com.lxk.model.StreamTag;
import com.lxk.service.StreamTagService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import javax.annotation.Resource;
import java.util.List;

/**
 * Created by lxk on 2017/4/7
 */
@Controller
@RequestMapping("streamTag")
public class StreamTagController {
    private static final Logger LOG = LoggerFactory.getLogger(StreamTagController.class);

    @Resource(name = "streamTagService")
    private StreamTagService streamTagService;

    @RequestMapping(value = "/getAllStreamTag", method = RequestMethod.GET)
    public ModelAndView getAllStreamTag() {
        LOG.error("getAllStreamTag");
        ModelAndView mav = new ModelAndView();
        mav.setViewName("streamTagDisplay");
        List<StreamTag> all =  streamTagService.findAllStreamTags();
        mav.addObject("students",all);
        return mav;
    }
}
