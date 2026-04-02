package com.personalweb.app.repository;

import com.personalweb.app.entity.KnowledgeNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeNoteRepository extends JpaRepository<KnowledgeNote, Long> {

    @Query("SELECT k FROM KnowledgeNote k LEFT JOIN FETCH k.createdBy ORDER BY k.updatedAt DESC")
    List<KnowledgeNote> findAllWithCreatedBy();

    @Query("SELECT k FROM KnowledgeNote k LEFT JOIN FETCH k.createdBy WHERE k.category = :category ORDER BY k.updatedAt DESC")
    List<KnowledgeNote> findByCategoryWithCreatedBy(@Param("category") String category);

    @Query("SELECT DISTINCT k.category FROM KnowledgeNote k WHERE k.category IS NOT NULL ORDER BY k.category")
    List<String> findDistinctCategories();

    @Query("SELECT k FROM KnowledgeNote k LEFT JOIN FETCH k.createdBy " +
           "WHERE LOWER(k.title) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(k.content) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(k.tags) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY k.updatedAt DESC")
    List<KnowledgeNote> search(@Param("q") String query);
}
