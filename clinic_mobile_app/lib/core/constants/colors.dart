import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF1E88E5); // Blue 600
  static const Color secondary = Color(0xFF43A047); // Green 600
  static const Color background = Color(0xFFF5F7FA);
  static const Color surface = Colors.white;
  static const Color error = Color(0xFFE53935);
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF42A5F5), Color(0xFF1E88E5)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
