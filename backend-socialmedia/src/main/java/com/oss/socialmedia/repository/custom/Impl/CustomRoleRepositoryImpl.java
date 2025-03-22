package com.oss.socialmedia.repository.custom.Impl;


import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import com.oss.socialmedia.model.RoleEntity;
import com.oss.socialmedia.repository.custom.CustomRoleRepository;


@Repository
public class CustomRoleRepositoryImpl implements CustomRoleRepository{

    private final MongoTemplate mongoTemplate;

    public CustomRoleRepositoryImpl(MongoTemplate mongoTemplate){
        this.mongoTemplate = mongoTemplate;
    }
    @Override
    public void deleteElementPermissionInRole( String req) {
        Query query = new Query();
        // Tạo một query để tìm role có permission chứa phần tử cần xóa
        query.addCriteria(Criteria.where("permissions").in(req));
        // Tạo update sử dụng toán tử $pull để xóa phần tử khỏi mảng "permissions"
        Update update = new Update();
        update.pull("permissions", req);
        // Thực hiện cập nhật
        mongoTemplate.updateMulti(query, update, RoleEntity.class);
    }

}
