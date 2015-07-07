
var models = require('../models/models.js');

// Autoload
exports.load = function(req, res, next, quizId){
	models.Quiz.find(quizId).then(function(quiz) {
		if (quiz) {
			req.quiz = quiz;
			next();
		} else { next(new Error('No existe el quizId=' + quizId)); }
	} 
	).catch(function(error) {next(error);});
};

// GET /quizes
exports.index = function(req, res) {
  if (req.query.search) {
       models.Quiz.findAll({where:["pregunta like ?", '%'+req.query.search+'%']}).then(function(quizes) {
			res.render('quizes/index', {quizes: quizes, errors: []});
     }).catch(function(error) { next(error);});
  } else {
     models.Quiz.findAll().then(
		function(quizes) {
			res.render('quizes/index.ejs', {quizes: quizes, errors: []});
		}
     ).catch(function(error) {next(error);});	
	}
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( // crea objeto quiz 
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// GET /quizes/:id
exports.show = function(req, res) {
	models.Quiz.find(req.params.quizId).then(function(quiz) {
		res.render('quizes/show', { quiz: req.quiz, errors: []});
	})
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render(
    'quizes/answer', 
    { quiz: req.quiz, 
      respuesta: resultado, 
      errors: []
    }
  );
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};


// GET /author
exports.author = function(req, res) {
	res.render('author', { errors: [] });
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

  var errors = quiz.validate();
  if (errors) {
    var i=0;
    var errores = new Array();
    for (var prop in errors) {
      errores[i++] = {message:errors[prop]}
    }
    res.render('quizes/new',{quiz: quiz, errors: errores});
  } else {
    //guarda en DB los campos pregunta y respuesta de quiz
    quiz.save({ fields: ["pregunta","respuesta"]}).then(function() {
      res.redirect('/quizes'); // Redireccion HTTP a lista de preguntas
      })
  }  
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

 var errors = req.quiz.validate();
 if (errors) {
    var i=0;
    var errores = new Array();
    for (var prop in errors) {
      errores[i++] = {message:errors[prop]}
    }
    res.render('quizes/edit',{quiz: req.quiz, errors: errores});
  } else {
    //guarda en DB los campos pregunta y respuesta de quiz
    req.quiz.save({ fields: ["pregunta","respuesta"]}).then(function() {
      res.redirect('/quizes'); // Redireccion HTTP a lista de preguntas
      })
  }  
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};

