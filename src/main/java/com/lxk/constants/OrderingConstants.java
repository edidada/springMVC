package com.lxk.constants;

import com.google.common.collect.Ordering;
import com.lxk.model.Blog;

import java.text.Collator;
import java.util.Locale;
import java.util.Objects;

/**
 * 排序
 *
 * @author wei.Li by 15/9/17
 */
public interface OrderingConstants {

    //汉字按拼音排序
    //collator.compare(left.getTitle(), right.getTitle())
    Collator collator = Collator.getInstance(Locale.CHINA);

    /**
     * 博客按阅读次数排序
     */
    Ordering<Blog> BLOG_READ_ORDERING = new Ordering<Blog>() {
        @Override
        public int compare(Blog left, Blog right) {
            if (left == null) {
                return -1;
            }
            if (right == null) {
                return 1;
            }
            return right.getRead() - left.getRead();
        }
    };

    /**
     * 博客按评论多少排序
     */
    Ordering<Blog> BLOG_PING_ORDERING = new Ordering<Blog>() {
        @Override
        public int compare(Blog left, Blog right) {
            if (left == null) {
                return -1;
            }
            if (right == null) {
                return 1;
            }
            return right.getPing() - left.getPing();
        }
    };

    /**
     * 博客按评论多少排序
     */
    Ordering<Blog> BLOG_INCREASE_ORDERING = new Ordering<Blog>() {
        @Override
        public int compare(Blog left, Blog right) {
            if (left == null || left.getIncrease() == null) {
                return -1;
            }
            if (right == null || right.getIncrease() == null) {
                return 1;
            }
            return right.getIncrease() - left.getIncrease();
        }
    };

    /**
     * 博客按顶多少排序
     */
    Ordering<Blog> BLOG_PRAISE_ORDERING = new Ordering<Blog>() {
        @Override
        public int compare(Blog left, Blog right) {
            if (left == null) {
                return -1;
            }
            if (right == null) {
                return 1;
            }
            return right.getPraise() - left.getPraise();
        }
    };

    /**
     * 博客按踩多少排序
     */
    Ordering<Blog> BLOG_TREAD_ORDERING = new Ordering<Blog>() {
        @Override
        public int compare(Blog left, Blog right) {
            if (left == null) {
                return -1;
            }
            if (right == null) {
                return 1;
            }
            if(Objects.equals(left.getTread(), right.getTread())){
                return 0;
            }
            return right.getTread() - left.getTread();
        }
    };

}
