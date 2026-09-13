from database import get_db_connection

class ContactModel:
    @staticmethod
    def get_all_contacts(user_id, search_query=None, category=None, favorites_only=False):
        """
        Retrieves all contacts belonging to a specific user, with optional search,
        category filter, and favorites filter.
        """
        connection = get_db_connection()
        if not connection:
            return []

        try:
            cursor = connection.cursor(dictionary=True)
            query = "SELECT * FROM contacts WHERE user_id = %s"
            params = [user_id]

            if favorites_only:
                query += " AND is_favorite = 1"

            if category and category.lower() != 'all':
                query += " AND category = %s"
                params.append(category)

            if search_query:
                query += " AND (name LIKE %s OR phone LIKE %s OR email LIKE %s)"
                wildcard = f"%{search_query}%"
                params.extend([wildcard, wildcard, wildcard])

            query += " ORDER BY name ASC"

            cursor.execute(query, tuple(params))
            contacts = cursor.fetchall()
            
            for c in contacts:
                if 'created_at' in c and c['created_at']:
                    if hasattr(c['created_at'], 'strftime'):
                        c['created_at'] = c['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        c['created_at'] = str(c['created_at'])
                c['is_favorite'] = bool(c['is_favorite'])
            
            return contacts
        except Exception as e:
            print(f"[Error] get_all_contacts: {e}")
            return []
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()

    @staticmethod
    def get_contact_by_id(contact_id, user_id):
        """
        Retrieves a single contact by its ID ensuring it belongs to the user.
        """
        connection = get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM contacts WHERE id = %s AND user_id = %s", (contact_id, user_id))
            contact = cursor.fetchone()
            if contact:
                if 'created_at' in contact and contact['created_at']:
                    if hasattr(contact['created_at'], 'strftime'):
                        contact['created_at'] = contact['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        contact['created_at'] = str(contact['created_at'])
                contact['is_favorite'] = bool(contact['is_favorite'])
            return contact
        except Exception as e:
            print(f"[Error] get_contact_by_id: {e}")
            return None
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()

    @staticmethod
    def create_contact(user_id, name, phone, email=None, address=None, category='Other', is_favorite=False):
        """
        Creates a new contact associated with user_id.
        """
        connection = get_db_connection()
        if not connection:
            return None, "Unable to connect to the database. Please check the backend configuration."

        try:
            cursor = connection.cursor(dictionary=True)
            fav_val = 1 if is_favorite else 0
            query = """
                INSERT INTO contacts (user_id, name, phone, email, address, category, is_favorite)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (user_id, name, phone, email, address, category, fav_val))
            connection.commit()
            
            contact_id = cursor.lastrowid
            return {
                "id": contact_id,
                "user_id": user_id,
                "name": name,
                "phone": phone,
                "email": email,
                "address": address,
                "category": category,
                "is_favorite": is_favorite
            }, None
        except Exception as e:
            print(f"[Error] create_contact: {e}")
            return None, str(e)
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()

    @staticmethod
    def update_contact(contact_id, user_id, name, phone, email=None, address=None, category='Other'):
        """
        Updates an existing contact ensuring it belongs to user_id.
        """
        connection = get_db_connection()
        if not connection:
            return False, "Unable to connect to the database. Please check the backend configuration."

        try:
            cursor = connection.cursor(dictionary=True)
            query = """
                UPDATE contacts
                SET name = %s, phone = %s, email = %s, address = %s, category = %s
                WHERE id = %s AND user_id = %s
            """
            cursor.execute(query, (name, phone, email, address, category, contact_id, user_id))
            connection.commit()
            return True, None
        except Exception as e:
            print(f"[Error] update_contact: {e}")
            return False, str(e)
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()

    @staticmethod
    def toggle_favorite(contact_id, user_id):
        """
        Toggles the is_favorite boolean value of a contact.
        """
        connection = get_db_connection()
        if not connection:
            return None, "Unable to connect to the database. Please check the backend configuration."

        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT is_favorite FROM contacts WHERE id = %s AND user_id = %s", (contact_id, user_id))
            contact = cursor.fetchone()
            if not contact:
                return None, "Contact not found"

            new_status = not bool(contact['is_favorite'])
            fav_val = 1 if new_status else 0
            cursor.execute("UPDATE contacts SET is_favorite = %s WHERE id = %s AND user_id = %s", (fav_val, contact_id, user_id))
            connection.commit()
            return new_status, None
        except Exception as e:
            print(f"[Error] toggle_favorite: {e}")
            return None, str(e)
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()

    @staticmethod
    def delete_contact(contact_id, user_id):
        """
        Deletes a contact by id and user_id.
        """
        connection = get_db_connection()
        if not connection:
            return False, "Unable to connect to the database. Please check the backend configuration."

        try:
            cursor = connection.cursor()
            cursor.execute("DELETE FROM contacts WHERE id = %s AND user_id = %s", (contact_id, user_id))
            connection.commit()
            
            if cursor.rowcount > 0:
                return True, None
            return False, "Contact not found or unauthorized"
        except Exception as e:
            print(f"[Error] delete_contact: {e}")
            return False, str(e)
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
