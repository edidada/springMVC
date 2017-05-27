package com.lxk.model;

import lombok.Data;

import java.util.Date;
import java.util.List;

/**
 * 因为前台传List集合博客信息，不得不这么传参。
 * <p>
 * Created by lxk on 2017/5/18
 */
@Data
public class BlogList {
    /**
     * 保存的一波博客信息
     */
    private List<Blog> blogList;
    /**
     * 作者名称
     */
    private String name;
    /**
     * 获取博客数据的日期
     */
    private Date date;
}
