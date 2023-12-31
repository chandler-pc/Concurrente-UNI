package com.concurrente.server.server;

import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;

import java.io.IOException;
import java.net.URL;
import java.util.ResourceBundle;


public class MenuController implements Initializable {
    @FXML
    private Label welcomeText;
    @FXML
    private TextField portTextField;
    private Stage primaryStage;
    public void setPrimaryStage(Stage primaryStage) {
        this.primaryStage = primaryStage;
    }
    @FXML
    protected void onHelloButtonClick() {
        String port = portTextField.getText();
        if (!port.isEmpty()) {
            Stage newStage = new Stage();
            FXMLLoader fxmlLoader = new FXMLLoader(MainGameApplication.class.getResource("server-view.fxml"));
            VBox root;
            try {
                root = fxmlLoader.load();
                Scene scene = new Scene(root, 350, 310);
                ServerController controller = fxmlLoader.getController();
                controller.setPort(port);
                newStage.setTitle("Server");
                newStage.setScene(scene);
                newStage.setResizable(false);
                newStage.show();
                newStage.setOnCloseRequest(new EventHandler<WindowEvent>() {
                    @Override
                    public void handle(WindowEvent event) {
                        System.out.println("Cerrando la ventana...");

                        System.exit(0);
                    }
                });

                primaryStage.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }





    @Override
    public void initialize(URL location, ResourceBundle resources) {
        numericOnly(portTextField);
    }
    public static void numericOnly(final TextField field) {
        field.textProperty().addListener(new ChangeListener<String>() {
            @Override
            public void changed(
                    ObservableValue<? extends String> observable,
                    String oldValue, String newValue) {
                if (!newValue.matches("\\d*")) {
                    field.setText(newValue.replaceAll("[^\\d]", ""));
                }
            }
        });
    }

}