package com.lxk.model;

import lombok.Data;

import java.util.List;

/**
 * Created by lxk on 2017/5/18
 */
@Data
public class BlogList {
    List<Blog> blogList;
    String name;
}
