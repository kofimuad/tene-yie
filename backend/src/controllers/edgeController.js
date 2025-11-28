// src/controllers/edgeController.js
import supabase from '../utils/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

export async function createEdge(req, res) {
  try {
    const { workflow_id, source_node_id, target_node_id } = req.body;

    if (!workflow_id || !source_node_id || !target_node_id) {
      return res.status(400).json({
        error: 'Missing required fields: workflow_id, source_node_id, target_node_id'
      });
    }

    if (source_node_id === target_node_id) {
      return res.status(400).json({
        error: 'Cannot connect a node to itself'
      });
    }

    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('id')
      .eq('id', workflow_id)
      .single();

    if (workflowError || !workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const { data: sourceNode } = await supabase
      .from('nodes')
      .select('id')
      .eq('id', source_node_id)
      .eq('workflow_id', workflow_id)
      .single();

    const { data: targetNode } = await supabase
      .from('nodes')
      .select('id')
      .eq('id', target_node_id)
      .eq('workflow_id', workflow_id)
      .single();

    if (!sourceNode || !targetNode) {
      return res.status(404).json({
        error: 'One or both nodes not found in this workflow'
      });
    }

    const { data: existingEdge } = await supabase
      .from('edges')
      .select('id')
      .eq('source_node_id', source_node_id)
      .eq('target_node_id', target_node_id)
      .single();

    if (existingEdge) {
      return res.status(400).json({
        error: 'Connection already exists between these nodes'
      });
    }

    const { data, error } = await supabase
      .from('edges')
      .insert([{
        id: uuidv4(),
        workflow_id,
        source_node_id,
        target_node_id
      }])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Connection created successfully',
      edge: data[0]
    });
  } catch (err) {
    console.error('Error creating edge:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getEdgesByWorkflow(req, res) {
  try {
    const { workflow_id } = req.query;

    if (!workflow_id) {
      return res.status(400).json({
        error: 'workflow_id query parameter required'
      });
    }

    const { data, error } = await supabase
      .from('edges')
      .select('*')
      .eq('workflow_id', workflow_id)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      edges: data,
      count: data.length
    });
  } catch (err) {
    console.error('Error fetching edges:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getEdgeById(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('edges')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Edge not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('Error fetching edge:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteEdge(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('edges')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Connection deleted successfully' });
  } catch (err) {
    console.error('Error deleting edge:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getConnectedNodes(req, res) {
  try {
    const { nodeId } = req.params;
    const { workflow_id } = req.query;

    if (!workflow_id) {
      return res.status(400).json({
        error: 'workflow_id query parameter required'
      });
    }

    const { data: outgoingEdges, error: outgoingError } = await supabase
      .from('edges')
      .select('target_node_id')
      .eq('source_node_id', nodeId)
      .eq('workflow_id', workflow_id);

    if (outgoingError) {
      return res.status(500).json({ error: outgoingError.message });
    }

    const targetNodeIds = outgoingEdges.map(edge => edge.target_node_id);

    if (targetNodeIds.length === 0) {
      return res.json({
        connectedNodes: [],
        message: 'No connected nodes'
      });
    }

    const { data: nodes, error: nodesError } = await supabase
      .from('nodes')
      .select('*')
      .in('id', targetNodeIds);

    if (nodesError) {
      return res.status(500).json({ error: nodesError.message });
    }

    res.json({
      sourceNodeId: nodeId,
      connectedNodes: nodes,
      count: nodes.length
    });
  } catch (err) {
    console.error('Error fetching connected nodes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}