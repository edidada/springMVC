package com.lxk.constants;

import com.google.common.collect.Ordering;
import com.lxk.model.Blog;

import java.text.Collator;
import java.util.Locale;

/**
 * 排序
 *
 * @author wei.Li by 15/9/17
 */
public interface OrderingConstants {

    Collator collator = Collator.getInstance(Locale.CHINA);

    /**
     * 博客按阅读次数排序
     */
    Ordering<Blog> BLOG_READ_ORDERING = new Ordering<Blog>() {
        @Override
        public int compare(Blog left, Blog right) {
            if (left == null || left.getRead() == null) {
                return -1;
            }
            if (right == null || right.getRead() == null) {
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
            if (left == null || left.getPing() == null) {
                return -1;
            }
            if (right == null || right.getPing() == null) {
                return 1;
            }
            return right.getPing() - left.getPing();
        }
    };

}
