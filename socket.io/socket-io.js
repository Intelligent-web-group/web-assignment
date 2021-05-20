exports.init = function (io) {

  const chat = io
      .of('/chat')
      .on('connection', function (socket) {
        try {
          socket.on('create or join', function (room, userId) {
            socket.join(room);
            chat.to(room).emit('joined', room, userId);
            console.log(room)
          });

          socket.on('chat', function (room, userId, chatText) {
            chat.to(room).emit('chat', room, userId, chatText);
          });

          socket.on('image', function (room, prevX, prevY, currX, currY) {
            chat.to(room).emit('image', prevX, prevY, currX, currY);
          });

          socket.on('updateImage', function (room) {
            chat.to(room).emit('updateImage');
          });

          socket.on('disconnect', function () {
            console.log('someone disconnected');
          });
        } catch (e) {
        }
      });

  const news = io
      .of('/news')
      .on('connection', function (socket) {
        try {

          socket.on('create or join', function (room, userId) {
            socket.join(room);
            socket.broadcast.to(room).emit('joined', room, userId);
          });

          socket.on('news', function (room, userId, chatText) {
            socket.broadcast.to(room).emit('news', room, userId, chatText);
          });

          socket.on('disconnect', function () {
            console.log('someone disconnected');
          });
        } catch (e) {
        }
      });
}
