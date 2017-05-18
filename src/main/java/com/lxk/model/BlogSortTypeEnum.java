package com.lxk.model;

import com.sun.istack.internal.Nullable;

/**
 * 博客排序类型枚举
 * <p>
 * Created by lxk on 2017/5/18
 */
public enum BlogSortTypeEnum {
    /**
     * 阅读次数
     */
    READ,
    /**
     * 评论
     */
    PING,
    /**
     * 赞
     */
    PRAISE,
    /**
     * 踩
     */
    TREAD;

    @Nullable
    public static BlogSortTypeEnum fromTypeName(String sortType) {
        if (Blog.READ.equals(sortType)) {
            return READ;
        } else if (Blog.PING.equals(sortType)) {
            return PING;
        }
        return null;
    }
}
