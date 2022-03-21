
<?php

	header('Content-Type: text/json; charset=utf-8');

	$data = new stdClass();
	$data->parameters = $_POST;

	if(isset($_FILES['blobField'])) {
		$blob = new stdClass();
		$blob->name = $_FILES['blobField']['name'];
		$blob->type = $_FILES['blobField']['type'];
		$blob->size = $_FILES['blobField']['size'];
		$data->blob = $blob;
	}
	echo json_encode($data);
?>



