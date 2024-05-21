Api virtual enviroment setup instructions:
This folder contains the .py file, an excel file and a requirements.txt file. 

In order to run the backend component on your local machine, you must follow these directions:
1. Install latest version of python and flask on your computer
2. Inside protein-visualizer folder, create a virtual env using the command "python -m venv myproject"
3. Activate the venv using the command "myproject\Scripts\activate" (Note: Only need to run this command once during the setup)
4. Copy the requirments.txt file into this new folder and run command "path/to/venv/python -m pip install --requirement requirements.txt" to install all necessary packages.
5. Copy the .py file and the excel file into the venv folder.
6. To run the .py file, run the command "flask run".
