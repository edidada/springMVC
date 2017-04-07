package com.lxk.service;

import com.lxk.model.StreamTag;
import com.lxk.repository.StreamTagRepository;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * Created by lxk on 2017/4/7
 */
@Service("streamTagService")
public class StreamTagService {

    @Resource(name = "streamTagRepository")
    private StreamTagRepository streamTagDao;

    public List<StreamTag> findAllStreamTags() {
        return streamTagDao.findAll();
    }
}
