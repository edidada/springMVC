package com.lxk.service;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.lxk.constants.OrderingConstants;
import com.lxk.model.Blog;
import com.lxk.model.BlogIndex;
import com.lxk.model.BlogSortTypeEnum;
import com.lxk.repository.BlogRepository;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Set;

/**
 * Created by lxk on 2017/5/18
 */
@Service("blogService")
public class BlogService {

    @Resource(name = "blogRepository")
    private BlogRepository dao;

    /**
     * 获得所有博客信息集合
     */
    public List<Blog> findAllBlog() {
        return dao.findAll();
    }

    /**
     * 根据文章标题获得博客信息
     *
     * @param title 博客文章标题
     */
    private List<Blog> findBlogByTitle(String title) {
        return dao.findByTitle(title);
    }

    /**
     * 获得top n，并按某类型排序。
     *
     * @param topN 前n个
     * @param type 类型：read or ping
     */
    public List<Blog> getTopNBlog(Integer topN, String type) {
        if (Strings.isNullOrEmpty(type)) {
            return null;
        }

        List<Blog> all = findAllBlog();
        if (all == null || all.isEmpty()) {
            return null;
        }
        countBlogIncrease(all);
        sortAllBlog(type, all);
        List<Blog> result = Lists.newArrayList();
        if (topN != null && topN > 0) {
            result = all.subList(0, topN);
        }
        return result;
    }

    private void countBlogIncrease(List<Blog> all) {
        for (Blog blog : all) {
            getOneBlogIncrease(blog);
        }
    }

    private void getOneBlogIncrease(Blog blog) {
        Set<BlogIndex> blogIndexSet = blog.getBlogIndexSet();
        if (blogIndexSet == null || blogIndexSet.size() <= 1) {
            return;
        }
        List<Integer> readList = Lists.newArrayList();
        for (BlogIndex blogIndex : blogIndexSet) {
            readList.add(blogIndex.getRead());
        }
        Collections.sort(readList);
        blog.setIncrease(readList.get(readList.size() - 1) - readList.get(0));
    }

    /**
     * 根据某类型排序集合
     *
     * @param type 类型，read或者ping{@link Blog#READ,Blog#PING}
     * @param list 博客信息集合
     */
    public void sortAllBlog(String type, List<Blog> list) {
        if (BlogSortTypeEnum.READ == BlogSortTypeEnum.fromTypeName(type)) {
            list.sort(OrderingConstants.BLOG_READ_ORDERING);
        } else if(BlogSortTypeEnum.PING == BlogSortTypeEnum.fromTypeName(type)){
            list.sort(OrderingConstants.BLOG_PING_ORDERING);
        } else if(BlogSortTypeEnum.INCREASE == BlogSortTypeEnum.fromTypeName(type)){
            list.sort(OrderingConstants.BLOG_INCREASE_ORDERING);
        }
    }

    /**
     * 循环保存博客信息集合，名称重复则不保存。
     *
     * @param blogList 博客信息集合
     * @param date     获得博客信息的时间
     */
    public Boolean saveList(List<Blog> blogList, Date date) {
        for (Blog blog : blogList) {
            Blog result = saveOne(blog, date);
            if (result == null) {
                System.out.println("save failed , title is :" + blog.getTitle());
                return false;
            }
        }
        return true;
    }

    /**
     * 保存一条数据
     */
    private Blog saveOne(Blog blog, Date date) {
        List<Blog> allByName = findBlogByTitle(blog.getTitle());
        //原来数据库没有，则新建
        if (allByName == null || allByName.size() == 0) {
            blog.getBlogIndexSet().add(getBlogIndex(blog, date));
        } else {
            //数据库存在，则更新
            Blog blogInDB = allByName.get(0);
            Set<BlogIndex> blogIndexSet = Sets.newHashSet(blogInDB.getBlogIndexSet());
            blogIndexSet.add(getBlogIndex(blog, date));
            blog.setBlogIndexSet(blogIndexSet);
            blog.setId(blogInDB.getId());//有ID，相当于更新。
        }
        return dao.save(blog);
    }

    /**
     * 获得某一篇博客的指标信息
     */
    private BlogIndex getBlogIndex(Blog blog, Date date) {
        BlogIndex blogIndex = new BlogIndex();
        blogIndex.setDate(date);
        blogIndex.setPing(blog.getPing());
        blogIndex.setRead(blog.getRead());
        blogIndex.setPraise(blog.getPraise());
        blogIndex.setTread(blog.getTread());
        return blogIndex;
    }

    /**
     * 判断每次不重复,true：不重复，false：重复
     */
    private boolean checkNameIsNotRepetition(String title) {
        List<Blog> allByName = findBlogByTitle(title);
        return (allByName == null || allByName.size() == 0);
    }
}
