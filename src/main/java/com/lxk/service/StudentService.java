package com.lxk.service;

import com.lxk.model.Student;
import com.lxk.repository.StudentRepository;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * Created by lxk on 2017/3/27
 */
@Service("studentService")
public class StudentService {

    @Resource(name = "studentRepository")
    private StudentRepository dao;

    public List<Student> getAllStudent() {
        return dao.findAll();
    }

    public Student save(Student student) {
        return dao.save(student);
    }

    public Student findStudetById(String id) {
        return dao.findById(id);
    }

    public List<Student> findStudetByName(String name) {
        return dao.findByName(name);
    }
}
