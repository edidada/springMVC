package com.lxk.repository;

import com.lxk.model.StreamTag;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Created by lxk on 2016/5/23.
 *
 */
@Repository("streamTagRepository")
public interface StreamTagRepository extends MongoRepository<StreamTag, String> {

    /**
     * 根据 ID 查询标签管理信息
     */
    @Query("{'id':?0}")
    StreamTag findById(String id);

    /**
     * 根据 name 查询标签管理信息
     */
    @Query("{'name':?0}")
    StreamTag findByName(String name);
}
