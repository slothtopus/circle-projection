library(tidyverse)

# Movement vector
move_vec <- c(23, 75)
# Start angle on circle (radians)
theta_orig <- (1.2/2)*pi
# Radius of circle (i.e. hypotenuse)
h <- 100

i <- round(as.vector(sqrt(move_vec %*% move_vec)))
step <- move_vec / i

theta_pos <- theta_orig
cat('Start theta_pos:', theta_pos, '\n')
theta_line <- c(theta_pos)

for(s in seq(i)) {
  tangent_vec <- c(1, -cos(theta_pos)/sin(theta_pos))
  projected_step <- as.vector((step %*% tangent_vec) / (tangent_vec %*% tangent_vec)) * tangent_vec
  
  new_pos <- c(h * cos(theta_pos), h * sin(theta_pos)) + projected_step
  theta_pos <- atan2(new_pos[2], new_pos[1])
  
  cat('New theta_pos:', theta_pos, '\n')
  theta_line <- c(theta_line, theta_pos)
}

projected_y <- sin(theta_line) * h
projected_x <- cos(theta_line) * h

tangent_a = -cos(theta_orig)/sin(theta_orig)
tangent_b = h * (sin(theta_orig) + cos(theta_orig)^2/sin(theta_orig))
tangent_x = seq(-tangent_b/tangent_a, 0, length = 100)
tangent_y = tangent_a * tangent_x + tangent_b

ggplot() +
  # circle
  geom_point(aes(x = cos(seq(0, 2*pi, length = 1000))*h, y = sin(seq(0, 2*pi, length = 1000))*h)) +
  # projected arc
  geom_point(aes(x = projected_x, y = projected_y), col = 'green') +
  # Start position radius
  geom_line(aes(x = c(0, cos(theta_orig)*h), y = c(0, sin(theta_orig)*h))) +
  # First tangent
  geom_line(aes(x = tangent_x, y = tangent_y), linetype = 'dashed') +
  # Movement vector
  geom_line(aes(x = c(0, move_vec[1]) + cos(theta_orig)*h,
                y = c(0, move_vec[2]) + sin(theta_orig)*h), col = 'red', size = 1)

