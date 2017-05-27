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

    /**
     * init：初始化页面
     */
    @RequestMapping(value = "", method = RequestMethod.GET)
    public ModelAndView init() {
        LOG.debug("---------------BlogController: init---------------");

        ModelAndView mav = new ModelAndView();
        mav.setViewName("blog/blog");
        return mav;
    }

    /**
     * 保存多个博客信息到数据库
     *
     * @param blogList n多个博客信息的集合，封装的对象
     */
    @ResponseBody
    @RequestMapping(value = "saveBlogList", method = RequestMethod.POST)
    public JsonResult saveBlogList(@RequestBody BlogList blogList) {
        if (blogList == null) {
            return new JsonResult(false, "blogList is null");
        }
        Boolean result = blogService.saveList(blogList.getBlogList(), blogList.getDate());
        return result ? new JsonResult(true, "保存成功") : new JsonResult(false, "保存失败");
    }

    /**
     * 获得所有博客信息，并按某类型排序。
     *
     * @param type 类型，read或者ping{@link Blog#READ,Blog#PING}
     */
    @ResponseBody
    @RequestMapping(value = "/getAllBlog", method = RequestMethod.GET)
    public List<Blog> getAllBlog(String type) {
        LOG.debug("---------------BlogController: findAllBlog---------------");
        LOG.debug("---------------type:\t" + type);

        List<Blog> all = blogService.findAllBlog();
        blogService.sortAllBlog(type, all);
        return all;
    }

    /**
     * 获得top n，并按某类型排序。
     *
     * @param topN 前N个
     * @param type 类型，read或者ping{@link Blog#READ,Blog#PING}
     */
    @ResponseBody
    @RequestMapping(value = "/getTopNBlog", method = RequestMethod.GET)
    public List<Blog> getTopNBlog(Integer topN, String type) {
        LOG.debug("---------------BlogController: getTopTenBlog---------------");
        LOG.debug("---------------topN:\t" + topN);
        LOG.debug("---------------type:\t" + type);

        return blogService.getTopNBlog(topN, type);
    }


}
