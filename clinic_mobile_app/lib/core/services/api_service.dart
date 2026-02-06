import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // ⚠️ ANDROID EMULATOR uses 10.0.2.2 to access computer's localhost
  // If using a PHYSICAL DEVICE, change this to your PC's IP address (e.g. http://192.168.1.15:5000/api)
  static const String baseUrl = 'http://10.0.2.2:5001/api';

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    final url = Uri.parse('$baseUrl$endpoint');
    print('POST Request to: $url');
    
    try {
      final response = await http.post(
        url,
        headers: await _getHeaders(),
        body: jsonEncode(data),
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network Error: $e');
    }
  }

  Future<dynamic> get(String endpoint) async {
    final url = Uri.parse('$baseUrl$endpoint');
    print('GET Request to: $url');

    try {
      final response = await http.get(
        url,
        headers: await _getHeaders(),
      );
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network Error: $e');
    }
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    } else {
      final errorBody = jsonDecode(response.body);
      throw Exception(errorBody['message'] ?? 'Unknown Error');
    }
  }
}
