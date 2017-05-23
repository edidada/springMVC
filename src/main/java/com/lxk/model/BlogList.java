package com.lxk.model;

import lombok.Data;

import java.util.List;

/**
 * 因为前台传List集合博客信息，不得不这么传参。
 * <p>
 * Created by lxk on 2017/5/18
 */
@Data
public class BlogList {
    List<Blog> blogList;
    String name;
}
