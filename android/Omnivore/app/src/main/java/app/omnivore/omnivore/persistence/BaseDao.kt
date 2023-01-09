package app.omnivore.omnivore.persistence

import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Update


interface BaseDao<T> {

  /**
   * Insert an object in the database.
   *
   * @param obj the object to be inserted.
   */
  @Insert(onConflict = OnConflictStrategy.REPLACE)
  fun insert(obj: T)

  /**
   * Insert an array of objects in the database.
   *
   * @param obj the objects to be inserted.
   */
  @Insert(onConflict = OnConflictStrategy.REPLACE)
  fun insert(vararg obj: T)

  /**
   * Update an object from the database.
   *
   * @param obj the object to be updated
   */
  @Update
  fun update(obj: T)

  /**
   * Delete an object from the database
   *
   * @param obj the object to be deleted
   */
  @Delete
  fun delete(obj: T)
}
