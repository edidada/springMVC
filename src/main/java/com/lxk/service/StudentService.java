package com.lxk.service;

import com.lxk.annotation.MethodLog;
import com.lxk.model.Student;
import com.lxk.repository.StudentRepository;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;

/**
 * Created by lxk on 2017/3/27
 */
@Service("studentService")
public class StudentService {

    @Resource(name = "studentRepository")
    private StudentRepository dao;

    @MethodLog(description = "查询-方法名称getAllStudent  ", clazz = Student.class)
    public List<Student> getAllStudent() {
        return dao.findAll();
    }

    @MethodLog(description = "保存-方法名称save", clazz = Student.class)
    public Student save(Student student) {
        if (student != null) {
            student.setCreateTime(new Date());
        }
        return dao.save(student);
    }

    @MethodLog(description = "保存-方法名称saveEmptyData", clazz = Student.class)
    public Student saveEmptyData(Student student) {
        return null;
    }

    public Student findStudetById(String id) {
        return dao.findById(id);
    }

    public List<Student> findStudetByName(String name) {
        return dao.findByName(name);
    }

    public List<Student> findStudetByNameAndAge(String name, int age) {
        return dao.findByNameAndAge(name, age);
    }

}
