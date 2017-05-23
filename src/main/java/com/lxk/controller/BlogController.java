package com.lxk.controller;

import com.lxk.httpModel.JsonResult;
import com.lxk.model.Blog;
import com.lxk.model.BlogList;
import com.lxk.service.BlogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import javax.annotation.Resource;
import java.util.List;

/**
 * 博客信息Controller
 * <p>
 * Created by lxk on 2017/5/18
 */
@Controller
@RequestMapping("blog")
public class BlogController {
    private static final Logger LOG = LoggerFactory.getLogger(BlogController.class);

    @Resource(name = "blogService")
    private BlogService blogService;

    @RequestMapping(value = "", method = RequestMethod.GET)
    public ModelAndView init() {
        LOG.debug("---------------BlogController: init---------------");

        ModelAndView mav = new ModelAndView();
        mav.setViewName("blog/blog");
        return mav;
    }

    @ResponseBody
    @RequestMapping(value = "saveBlogList", method = RequestMethod.POST)
    public JsonResult saveBlogList(@RequestBody BlogList blogList) {
        if (blogList == null) {
            return new JsonResult(false, "blogList is null");
        }
        Boolean result = blogService.saveList(blogList.getBlogList());
        return result ? new JsonResult(true, "保存成功") : new JsonResult(false, "保存失败");
    }

    @ResponseBody
    @RequestMapping(value = "/getAllBlog", method = RequestMethod.GET)
    public List<Blog> getAllBlog(String type) {
        LOG.debug("---------------BlogController: findAllBlog---------------");
        LOG.debug("---------------type:\t" + type);

        List<Blog> all = blogService.findAllBlog();
        blogService.sortAllBlog(type, all);
        return all;
    }

    @ResponseBody
    @RequestMapping(value = "/getTopNBlog", method = RequestMethod.GET)
    public List<Blog> getTopNBlog(Integer topN, String type) {
        LOG.debug("---------------BlogController: getTopTenBlog---------------");
        LOG.debug("---------------topN:\t" + topN);
        LOG.debug("---------------type:\t" + type);

        return blogService.getTopNBlog(topN, type);
    }


}
