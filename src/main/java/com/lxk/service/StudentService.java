package com.lxk.service;

import com.lxk.model.Student;
import com.lxk.repository.StudentDao;
import com.lxk.repository.StudentRepository;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * Created by lxk on 2017/3/27
 */
@Service("studentService")
public class StudentService {

    @Resource(name = "studentDao")
    private StudentDao studentDao;

    @Resource(name = "studentRepository")
    private StudentRepository dao;

    public List<Student> getAllStudent() {
        return studentDao.findAll();
    }

    public List<Student> getAllStudentInMongo() {
        return dao.findAll();
    }

    public Student findStudetById(String id) {
        return dao.findById(id);
    }

    public List<Student> findStudetByName(String name) {
        return dao.findByName(name);
    }
}
