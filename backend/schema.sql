CREATE EXTENSION vector;

CREATE OR REPLACE FUNCTION chunks_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = to_tsvector('english',
        CASE
            WHEN NEW.has_image THEN
                coalesce(NEW.content, '') || ' ' || coalesce(NEW.summarised_content, '')
            ELSE
                coalesce(NEW.content, '')
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;