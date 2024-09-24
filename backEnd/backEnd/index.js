const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

//Getting access to FrontEnd folder
app.use(express.static(path.join(__dirname, '../FrontEnd')));

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    //console.log("hello World");
    //res.send('Hello World');
    //res.sendFile('/index.html');
    console.log("hello World");
    res.send("<h1>Hello !!</h1>");
});

//Posting the Add Production Company
app.post('/insertProduction', (req, res) => {
    const { empID, empName, address } = req.body;
    console.log(empID, empName, address);

    db.beginTransaction((err) => {
        if (err) throw err;

        //add production company
        const companyQ = 'INSERT INTO production_company VALUES(?,?,?)';
        db.query(companyQ, [empID, address, empName], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    throw err;
                });
            }
            else {
                console.log("Successfull!!!");
            }
        });

        //Commit The Whole Process
        db.commit((err) => {
            if (err) {
                return db.rollback(() => {
                    throw err;
                });
            }
            res.redirect('/success.html');
        });

    });
});

app.post('/insertMovie', (req, res) => {

    const { Mtitle, Myear, Mplot, checkbox1, checkbox2, checkbox3, checkbox4, checkbox5, Mlen, PC, book_author } = req.body;
    console.log(Mtitle, Myear, Mplot, checkbox1, checkbox2, checkbox3, checkbox4, checkbox5, Mlen, PC, book_author);

    const checkbox = [checkbox1, checkbox2, checkbox3, checkbox4, checkbox5];
    console.log(book_author);

    db.beginTransaction((err) => {
        if (err) throw err;

        //Add Movie details
        const insertsql = 'INSERT INTO movie(`title`, `year_of_release`, `length_minute`, `plot_outline`, `p_id`) VALUES (?,?,?,?,?)';
        db.query(insertsql, [Mtitle, Myear, Mlen, Mplot, PC], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    throw err;
                });
            }
            else {
                console.log("Successfull!!!");
            }
        });

        const sqlm_id = 'SELECT MAX(m_id) FROM movie';
        db.query(sqlm_id, [], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    throw err;
                });
            }

            else {
                console.log("movie id - ", result[0]['MAX(m_id)']);
                //Add quotes
                const m_id = result[0]['MAX(m_id)'];
                for (let i = 0; i < book_author.length; i++) {
                    const insertquote = 'INSERT INTO quotes(`quote`,`m_id`) VALUES (?,?)';
                    db.query(insertquote, [book_author[i], m_id], (err, result) => {
                        if (err) {
                            return db.rollback(() => {
                                throw err;
                            });
                        }
                        else {
                            console.log("Successful");
                        }
                    });
                }

                console.log("movieeeeee - ", m_id);
                console, log("check  - ", checkbox);

                const insertquote2 = 'INSERT INTO has_genres(`m_id`,`g_id`) VALUES (?,?)';
                for (let i = 0; i < 5; i++) {
                    if (checkbox[i] != null) {
                        db.query(insertquote2, [m_id, checkbox[i]], (err, result) => {
                            if (err) {
                                return db.rollback(() => {
                                    throw err;
                                });
                            }
                            else {
                                console.log("Successful");
                            }
                        });
                    }
                }
            }
        });


        db.commit((err) => {
            if (err) {
                return db.rollback(() => {
                    throw err;
                });
            }
            res.redirect('/success.html');
        });
    })
})


app.post('/insertActor', (req, res) => {
    const { Aname, Adob, AGender, APosition, Aaddress, movie, movie_role, dataContainer } = req.body;
    console.log(Aname, Adob, AGender, APosition, Aaddress, movie, movie_role, dataContainer);
    db.beginTransaction((err) => {
        if (err) throw err;

        // Add people details
        const insertsql = 'INSERT INTO people(`person_name`, `person_dob`, `person_type`, `person_gender`, `person_address`) VALUES (?,?,?,?,?)';
        db.query(insertsql, [Aname, Adob, "actor", AGender, Aaddress], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    throw err;
                });
            }

            console.log("Insertion in people - Successful!!!");

            // Extract the person_id
            const sql_person_id = 'SELECT MAX(person_id) as person_id FROM people';
            db.query(sql_person_id, [], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        throw err;
                    });
                }

                const person_id = result[0]['person_id'];
                console.log("person id - ", person_id);

                // Insert into actors table
                const insert_actor = 'INSERT INTO actors(`person_id`) VALUES (?)';
                db.query(insert_actor, [person_id], (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            throw err;
                        });
                    }

                    console.log("Insertion in actors - Successful!!!");

                    // Insert into acted_by table (m_id, person_id, role)
                    const insert_acted_by = 'INSERT INTO acted_by(`m_id`, `person_id`, `role`) VALUES (?, ?, ?)';
                    for (let i = 0; i < movie.length; i++) {
                        db.query(insert_acted_by, [movie[i], person_id, movie_role[i]], (err, result) => {
                            if (err) {
                                return db.rollback(() => {
                                    throw err;
                                });
                            }

                            console.log("Insertion in acted_by - Successful!!!");
                        });
                    }
                    const insert_quotes = 'UPDATE quotes SET person_id=? WHERE q_id=?';
                    for (let i = 0; i < dataContainer.length; i++) {
                        if(dataContainer[i]!=null){
                            db.query(insert_quotes, [person_id, dataContainer[i]], (err, result) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.log(err);
                                        throw err;
                                    });
                                }

                                console.log("Quote added");
                            });
                         }
                    }

                    // Commit the transaction
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                throw err;
                            });
                        }

                        res.redirect('/success.html');
                    });
                });
            });
        });
    });
});


app.post('/insertDirector', (req, res) => {
    const { Dname, Ddob, Dgender, Daddress, movie } = req.body;
    console.log(Dname, Ddob, Dgender, Daddress, movie);

    db.beginTransaction((err) => {
        if (err) throw err;
        //Add people details
        const insertsql = 'INSERT INTO people(`person_name`, `person_dob`, `person_type`, `person_gender`, `person_address`) VALUES (?,?,?,?,?)';
        db.query(insertsql, [Dname, Ddob, "director", Dgender, Daddress], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    throw err;
                });
            }
            else {
                console.log("Insertion in people -Successfull!!!");
            }
        });
        //extract the person_id
        const sql_person_id = 'SELECT MAX(person_id) FROM people';
        db.query(sql_person_id, [], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    throw err;
                });
            }

            else {
                console.log("person id - ", result[0]['MAX(person_id)']);
                const person_id = result[0]['MAX(person_id)'];


                //update actor table
                const insert_director = 'INSERT INTO directors(`person_id`) VALUES (?)';
                db.query(insert_director, [person_id], (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            throw err;
                        });
                    }
                    else {
                        console.log("Insertion in directors - Successfull!!!");
                    }
                })

                //insert in dircted_by table(m_id,person_id,role)

                console.log("movie id2 - ", movie);
                console.log("person2 - ", person_id);
                for (let i = 0; i < movie.length; i++) {
                    //insert in dircted_by table
                    console.log("movie id3 - ", movie[i]);
                    console.log("person2 - ", person_id);
                    const insert_directed_by = 'INSERT INTO directed_by(`d_id`,`m_id`) VALUES (?,?)';
                    db.query(insert_directed_by, [person_id, movie[i]], (err, result) => {
                        if (err) {
                            return db.rollback(() => {
                                console.log(err);
                                throw err;
                            });
                        }
                        else {
                            console.log("Insertion in directed_by -Successfull!!!");
                        }
                    })
                }
            }
        });

        //commit
        db.commit((err) => {
            if (err) {
                return db.rollback(() => {
                    throw err;
                });
            }
            res.redirect('/success.html');
        });
    })
});


app.get('/addMovie', (req, res) => {
    let sql = 'SELECT p_name, p_id FROM production_company';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/report2', (req, res) => {
    let sql = 'SELECT p_name, p_id FROM production_company';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});
app.get('/getreport1', (req, res) => {
    const syear = req.query.syear;
    const eyear = req.query.eyear;
    console.log(syear, eyear);

    const insertsql = `
                    SELECT 
                m.m_id, 
                m.title, 
                m.year_of_release, 
                m.length_minute, 
                m.plot_outline, 
                GROUP_CONCAT(DISTINCT g.g_name ORDER BY g.g_name ASC) AS genres,
                p.person_name AS director_name,
                pc.p_name AS production_company
            FROM 
                movie m
            JOIN 
                has_genres hg ON m.m_id = hg.m_id
            JOIN 
                genres g ON hg.g_id = g.g_id
            JOIN 
                directed_by db ON m.m_id = db.m_id
            JOIN 
                directors d ON db.d_id = d.d_id
            JOIN 
                people p ON d.person_id = p.person_id
            JOIN 
                production_company pc ON m.p_id = pc.p_id
            WHERE 
                m.year_of_release BETWEEN ? AND ?
            GROUP BY 
                m.m_id, 
                m.title, 
                m.year_of_release, 
                m.length_minute, 
                m.plot_outline, 
                p.person_name, 
                pc.p_name
            ORDER BY 
                m.year_of_release DESC, 
                genres ASC;
                `;

    db.query(insertsql, [syear, eyear], (err, result) => {
        if (err) {
            return res.status(500).send('Database query error');
        }
        res.json(result);
    });
});


app.get('/getreport2', (req, res) => {
    const pc = req.query.PC;
    console.log(pc);

    const insertsql = `
            SELECT 
            m.m_id,
            m.title,
            m.year_of_release,
            m.length_minute AS length_minutes,
            m.plot_outline,
            GROUP_CONCAT(DISTINCT g.g_name ORDER BY g.g_name ASC) AS genres,
            p.person_name AS director_name,
            pc.p_id AS production_company_id,
            pc.p_name AS production_company_name
        FROM 
            movie m
        JOIN 
            has_genres hg ON m.m_id = hg.m_id
        JOIN 
            genres g ON hg.g_id = g.g_id
        JOIN 
            production_company pc ON m.p_id = pc.p_id
        JOIN 
            directed_by db ON m.m_id = db.m_id
        JOIN 
            directors d ON db.d_id = d.d_id
        JOIN 
            people p ON d.person_id = p.person_id
        WHERE 
            pc.p_id = ?
        GROUP BY 
            m.m_id, m.title, m.year_of_release, length_minutes, m.plot_outline, director_name, production_company_id, production_company_name
        ORDER BY 
            genres ASC, director_name ASC;`;

    db.query(insertsql, [pc], (err, result) => {
        if (err) {
            return res.status(500).send('Database query error');
        }
        res.json(result);
    });
});


app.get('/addActor', (req, res) => {
    const selectedValue = req.query.selectedValue;
    if (selectedValue != null) {
        let sql = 'SELECT q_id,quote FROM quotes WHERE m_id=?';
        db.query(sql, [selectedValue], (err, results) => {
            if (err) throw err;
            console.log("okk");
            console.log(results);
            res.json(results);
        });
    }
    else {
        let sql = 'SELECT m_id, title FROM movie';
        db.query(sql, (err, results) => {
            if (err) throw err;
            res.json(results);
        });
    }
});

app.get('/addDirector', (req, res) => {
    let sql = 'SELECT m_id, title FROM movie';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});


app.listen(5000, () => {
    console.log('Server started on http://localhost:5000');
});

const db = require('./db');
const { log } = require('console');

