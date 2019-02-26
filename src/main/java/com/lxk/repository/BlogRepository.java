//package com.lxk.repository;
//
//import com.lxk.model.Blog;
//import org.springframework.data.mongodb.repository.MongoRepository;
//import org.springframework.data.mongodb.repository.Query;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//
///**
// * 博客Repository
// * <p>
// * Created by lxk on 2017/5/18
// */
//@Repository("blogRepository")
//public interface BlogRepository extends MongoRepository<Blog, String> {
//
//    /**
//     * 根据文章标题获得博客信息
//     */
//    @Query("{'title':?0}")
//    List<Blog> findByTitle(String title);
//
//}
